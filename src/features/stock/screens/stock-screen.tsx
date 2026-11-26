import { t } from '../../../core/i18n';
import { PlaceholderScreen } from '../../../shared/components';

export function StockScreen(): React.JSX.Element {
  return (
    <PlaceholderScreen
      title={t('stock.title')}
      description={t('stock.description')}
      icon="cube-outline"
    />
  );
}
