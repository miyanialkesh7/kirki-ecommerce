import TextareaField from '@/components/form/textarea-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Text from '@/components/ui/text';
import { theme } from '@/theme';
import { __ } from '@/wpi18n';

type NotesCardProps = {
  isEditable?: boolean;
};

const NotesCard = ({ isEditable = true }: NotesCardProps) => {
  return (
    <Card cssOverride={{ gap: theme.spacing[2] }}>
      <CardHeader>
        <CardTitle>
          <Text variant="small" weight="medium">
            {__('Notes', 'kirki-ecommerce')}
          </Text>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TextareaField
          name="admin_notes"
          disabled={!isEditable}
          placeholder={!isEditable ? '' : __('Write a note...', 'kirki-ecommerce')}
          rows={3}
        />
      </CardContent>
    </Card>
  );
};

NotesCard.displayName = 'NotesCard';

export default NotesCard;
