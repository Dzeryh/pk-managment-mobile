import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { t } from '../core/i18n';
import { colors, theme, typography } from '../core/theme';
import { ArticlesScreen } from '../features/articles/screens/articles-screen';
import { HomeScreen } from '../features/home/screens/home-screen';
import { MoreScreen } from '../features/more/screens/more-screen';
import { SalesScreen } from '../features/sales/screens/sales-screen';
import { StockScreen } from '../features/stock/screens/stock-screen';
import type { MainTabParamList } from './types';

type NomOnglet = keyof MainTabParamList;
type NomIcone = React.ComponentProps<typeof Ionicons>['name'];

const ONGLETS: Record<NomOnglet, { libelle: string; actif: NomIcone; inactif: NomIcone }> = {
  Home: { libelle: t('nav.home'), actif: 'home', inactif: 'home-outline' },
  Articles: { libelle: t('nav.articles'), actif: 'pricetags', inactif: 'pricetags-outline' },
  Stock: { libelle: t('nav.stock'), actif: 'cube', inactif: 'cube-outline' },
  Sales: { libelle: t('nav.sales'), actif: 'cart', inactif: 'cart-outline' },
  More: {
    libelle: t('nav.more'),
    actif: 'ellipsis-horizontal-circle',
    inactif: 'ellipsis-horizontal-circle-outline',
  },
};

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Onglets principaux : Accueil, Articles, Stock, Ventes, Plus. */
export function MainTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const onglet = ONGLETS[route.name];

        return {
          headerShown: false,
          title: onglet.libelle,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            minHeight: 60,
            paddingTop: 6,
            paddingBottom: 8,
            borderTopColor: colors.line,
            backgroundColor: colors.surface,
          },
          tabBarLabelStyle: {
            ...typography.caption,
            fontWeight: '600',
          },
          tabBarItemStyle: {
            minHeight: theme.touchTarget,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? onglet.actif : onglet.inactif} size={22} color={color} />
          ),
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Articles" component={ArticlesScreen} />
      <Tab.Screen name="Stock" component={StockScreen} />
      <Tab.Screen name="Sales" component={SalesScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
