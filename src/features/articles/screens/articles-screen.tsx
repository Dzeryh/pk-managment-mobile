import { t } from '../../../core/i18n';
import { PlaceholderScreen } from '../../../shared/components';

export function ArticlesScreen(): React.JSX.Element {
  return (
    <PlaceholderScreen
      title={t('articles.title')}
      description={t('articles.description')}
      icon="pricetags-outline"
    />
  );
}
