import { t } from '../../../core/i18n';
import { PlaceholderScreen } from '../../../shared/components';

export function SalesScreen(): React.JSX.Element {
  return (
    <PlaceholderScreen
      title={t('sales.title')}
      description={t('sales.description')}
      icon="cart-outline"
    />
  );
}
