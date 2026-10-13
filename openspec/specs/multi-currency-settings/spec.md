## Purpose

Lets a store administrator manage the currencies customers can shop in — adding
currencies, maintaining their exchange rates against the base currency, choosing which
currency is the base, activating or removing currencies, and refreshing rates on
demand from an external provider — all from the Currency settings page.

## Requirements

### Requirement: Available currencies panel is usable

The Currency settings page SHALL present the store's currencies as an editable list
with no "coming soon" gating. Adding a currency SHALL be available at all times the
page is shown.

#### Scenario: Panel is interactive on load

- **WHEN** an administrator opens the Currency settings page
- **THEN** the "Available Currencies" list renders every currency returned by the
  currencies API
- **AND** the "Add Currency" control is enabled

#### Scenario: Adding currencies

- **WHEN** the administrator picks one or more currencies in the add flow, enters an
  exchange rate for each, and confirms
- **THEN** each selected currency is persisted with the entered rate and appears in
  the list
- **AND** when the store had no currencies, the first added currency becomes the base

### Requirement: Exchange rate is edited inline

Each non-base currency row SHALL expose its exchange rate as an inline numeric input.
The store SHALL NOT present a separate dialog for editing a single currency's rate.

#### Scenario: Committing a valid rate

- **WHEN** the administrator changes a row's rate input to a positive number and blurs
  or presses Enter
- **THEN** the new rate is persisted for that currency and reflected in the list

#### Scenario: Rejecting an invalid rate

- **WHEN** the administrator enters a blank, zero, or negative value and commits
- **THEN** the input reverts to the last persisted rate and no update request is sent

#### Scenario: Base currency rate is fixed

- **WHEN** the administrator views the base currency row
- **THEN** its rate is shown as 1 and cannot be edited

### Requirement: Changing the base currency recalculates exchange rates

Every stored exchange rate SHALL mean "units of this currency per 1 unit of the base
currency". When a currency that is not the base becomes the base, the store SHALL, in
one atomic operation:

- set the new base currency's exchange rate to 1;
- set every other stored currency's exchange rate to its previous rate divided by the
  previous rate of the new base, rounded to 6 decimal places.

This SHALL apply whatever way the base changes: a currency update, or a currency
created as the base while another base exists. When the new base had no stored rate
against the previous base, or that rate was not a positive number, the other rates
SHALL stay unchanged and only the new base's rate SHALL be set to 1.

#### Scenario: Setting a non-base currency as the base

- **WHEN** USD is the base at rate 1, EUR has rate 0.5 and GBP has rate 0.25, and the
  administrator sets EUR as the base
- **THEN** EUR has rate 1 and is the only base
- **AND** USD has rate 2
- **AND** GBP has rate 0.5

#### Scenario: Rates sent in the same request after the base changes

- **WHEN** a single `PUT /currencies` request first makes a currency the base and then
  sends a later item for another currency with an explicit rate
- **THEN** the later item's rate is stored as sent, because items are applied in
  request order

#### Scenario: Creating a currency as the base

- **WHEN** USD is the base at rate 1 and EUR has rate 0.5, and a `POST /currencies`
  request creates GBP as the base with rate 0.25
- **THEN** GBP has rate 1 and is the only base
- **AND** USD has rate 4
- **AND** EUR has rate 2

#### Scenario: Creating the first currency as the base

- **WHEN** the store has no base currency and a currency is created as the base with
  any positive rate
- **THEN** that currency has rate 1

#### Scenario: Recalculation fails

- **WHEN** the base change fails part of the way through
- **THEN** no currency's base flag or exchange rate is changed

### Requirement: The base currency rate is always 1

The base currency's stored exchange rate SHALL be 1. A request that updates the
current base with a different rate SHALL still store 1 for it.

#### Scenario: Updating the base with another rate

- **WHEN** a `PUT /currencies` request updates the current base currency with rate 3
- **THEN** the response and the stored currency show rate 1
- **AND** the other currencies' rates do not change

### Requirement: Currency activation toggle

Each non-base currency row SHALL provide a toggle that activates or deactivates the
currency for storefront use. The base currency SHALL NOT be deactivatable.

#### Scenario: Toggling a currency

- **WHEN** the administrator flips a non-base currency's toggle
- **THEN** the currency's active state is persisted and the row reflects the new state

### Requirement: Row actions live in a three-dot menu behind confirmation

Each non-base currency row SHALL offer a three-dot (overflow) menu containing exactly
"Set as default" and "Delete". Selecting either SHALL open a confirmation dialog, and
the action SHALL run only when the administrator confirms. The base currency row SHALL
show no overflow menu. Deleting a currency SHALL NOT be blocked by products that exist
in the store, including products created while that currency was the base.

#### Scenario: Setting the base currency

- **WHEN** the administrator chooses "Set as default" on a non-base currency and
  confirms the dialog
- **THEN** that currency becomes the base currency and the previous base is demoted
- **AND** the list shows the new base at rate 1 and every other currency at its
  recalculated rate
- **AND** the update request contains only the row of the new base currency
- **AND** dismissing the dialog makes no change

#### Scenario: Deleting a currency

- **WHEN** the administrator chooses "Delete" on a non-base currency and confirms the
  dialog
- **THEN** the currency is removed and the list refreshes
- **AND** dismissing the dialog makes no change

#### Scenario: Deleting a currency that was previously the base

- **WHEN** the administrator switches the store's base currency, and then chooses
  "Delete" on the currency that was previously the base and confirms the dialog
- **THEN** that currency is removed even though products were created while it was the
  base
- **AND** those products keep their stored amounts, which are read in the store's
  current base currency

### Requirement: Currency write requests carry only currency fields

Requests that create or update currencies SHALL send only currency data fields
(identifier, name, code, symbol, exchange rate, base flag, active flag) and SHALL NOT
include presentation-only values derived for the list view.

#### Scenario: Update payload is clean

- **WHEN** any row action or inline edit triggers a currency update
- **THEN** the request body contains only currency data fields for the affected
  currency

### Requirement: Currency update reports total failure

When a bulk currency update is requested and every item fails, the API SHALL respond
with an error status (not a success status) and include the per-item error messages.
A partially successful update SHALL still succeed but SHALL include the error messages
for the failed items.

#### Scenario: All items fail

- **WHEN** a `PUT /currencies` request is made where no item can be updated
- **THEN** the response status is `422`
- **AND** the response body lists the failure reasons

#### Scenario: Some items fail

- **WHEN** a `PUT /currencies` request is made where some items update and others fail
- **THEN** the response is successful
- **AND** the response body includes the failure reasons for the failed items

### Requirement: On-demand exchange rate sync

The store SHALL provide an endpoint and a "Sync now" control that pull fresh exchange
rates for all currencies from the configured provider and persist them, along with the
sync timestamp and, where the provider reports it, API usage.

#### Scenario: Successful sync

- **WHEN** a provider and API key are configured and the administrator triggers a sync
- **THEN** each currency's exchange rate is updated from the provider
- **AND** the last-sync timestamp is recorded
- **AND** the currency list and its "Last synced" indicator refresh

#### Scenario: No provider configured

- **WHEN** a sync is triggered with no exchange-rate provider configured
- **THEN** the request fails with a client error and a message telling the
  administrator to configure a provider first
- **AND** no rates change

#### Scenario: Provider rejects the request

- **WHEN** the provider returns an error (for example an invalid API key) during a sync
- **THEN** the request fails with the provider's error message surfaced to the
  administrator
- **AND** no rates change

#### Scenario: Sync control requires saved settings

- **WHEN** the administrator has unsaved changes to the provider configuration
- **THEN** the "Sync now" control is disabled until the settings are saved

### Requirement: Exchange rate provider is configurable, automatic updates stay off

The administrator SHALL be able to select an exchange-rate provider and enter its API
key, update frequency and fallback behaviour, and save them with the rest of the
currency settings. The "automatic updates" toggle SHALL remain disabled and no
scheduled sync SHALL run as part of this capability.

#### Scenario: Saving provider configuration

- **WHEN** the administrator selects a provider, enters an API key, and saves the
  Currency settings page
- **THEN** the provider and its configuration are persisted
- **AND** the "Sync now" control becomes available

#### Scenario: Automatic updates unavailable

- **WHEN** the administrator views the automatic-updates section
- **THEN** the automatic-updates toggle is disabled and cannot be enabled

### Requirement: Last synced indicator

The available-currencies panel SHALL show a "Last synced" indicator whenever a
provider is configured and a last-sync timestamp exists, independent of the
automatic-updates toggle.

#### Scenario: Indicator shown after a sync

- **WHEN** a provider is configured and at least one sync has completed
- **THEN** the panel shows when rates were last synced

#### Scenario: Indicator hidden without a sync

- **WHEN** no provider is configured or no sync has ever completed
- **THEN** the panel shows no "Last synced" time

### Requirement: Exactly one base currency exists

The store SHALL keep exactly one currency flagged as the base currency. Saving a currency as the base SHALL demote every other currency, whether or not the request names them and in whatever order rows arrive. A request that clears the flag on the current base without making another currency the base SHALL NOT leave the store without a base currency. A create request that flags more than one currency as base SHALL be rejected as invalid, and none of its currencies SHALL be inserted.

#### Scenario: Setting a new base with a single-row request

- **WHEN** a request sets one currency as base and does not mention the previous base
- **THEN** that currency is the base
- **AND** the previous base is no longer flagged as base

#### Scenario: Whole-list request, old base first

- **WHEN** the administrator sets a new default in the currency list and the request sends the previous base before the new base
- **THEN** exactly one currency is flagged as base afterwards, the new one

#### Scenario: Whole-list request, new base first

- **WHEN** the same request sends the new base before the previous base
- **THEN** exactly one currency is flagged as base afterwards, the new one

#### Scenario: Clearing the only base

- **WHEN** a request clears the base flag on the current base and no other currency in the request becomes the base
- **THEN** the current base remains the base

#### Scenario: Creating a currency as base

- **WHEN** a currency is created with the base flag while another currency is the base
- **THEN** the new currency is the only base

#### Scenario: Creating two base currencies in one request

- **WHEN** a create request flags two or more of its currencies as base
- **THEN** the request is rejected with a validation error
- **AND** none of its currencies is inserted and the existing base is unchanged
