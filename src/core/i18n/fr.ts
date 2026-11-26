/**
 * Dictionnaire français. Source unique des libellés visibles.
 *
 * Ajouter une langue = ajouter un dictionnaire ici et l'exposer dans
 * `src/core/i18n/index.ts` (le malgache est prévu après le sprint 1).
 */
export const fr = {
  'app.name': 'P&K Business Manager',
  'app.tagline': 'Gestion commerciale de la boutique',
  'app.footer': 'P&K Fashion and Tech · Madagascar',

  'connectivity.online': 'En ligne',
  'connectivity.offline': 'Hors ligne',

  'common.retry': 'Réessayer',
  'common.cancel': 'Annuler',
  'common.loading': 'Chargement…',

  'splash.loading': 'Vérification de la session…',

  'auth.login.title': 'Connexion',
  'auth.login.subtitle': 'Accédez à votre espace de gestion.',
  'auth.login.email': 'Adresse e-mail',
  'auth.login.emailPlaceholder': 'vous@exemple.mg',
  'auth.login.password': 'Mot de passe',
  'auth.login.passwordPlaceholder': '••••••••',
  'auth.login.submit': 'Se connecter',
  'auth.login.submitting': 'Connexion…',
  'auth.error.emailRequired': 'Saisissez votre adresse e-mail.',
  'auth.error.emailInvalid': 'Saisissez une adresse e-mail valide.',
  'auth.error.passwordRequired': 'Saisissez votre mot de passe.',
  'auth.error.generic': 'Une erreur est survenue. Réessayez plus tard.',
  'auth.logout': 'Se déconnecter',
  'auth.logout.pending': 'Déconnexion…',

  'roles.admin': 'Administrateur',
  'roles.seller': 'Vendeur',

  'nav.home': 'Accueil',
  'nav.articles': 'Articles',
  'nav.stock': 'Stock',
  'nav.sales': 'Ventes',
  'nav.more': 'Plus',

  'home.eyebrow': 'Tableau de bord',
  'home.greeting': 'Bienvenue',
  'home.subtitle': 'Sprint 1 : socles et authentification.',
  'home.revenueToday': 'Recettes du jour',
  'home.pendingOperations': 'Opérations en attente',
  'home.onlineOnly': 'Les données du jour se chargent quand la connexion revient.',
  'home.account': 'Compte connecté',
  'home.email': 'E-mail',
  'home.role': 'Rôle',
  'home.loadError': 'Impossible d’actualiser votre profil.',

  'articles.title': 'Articles',
  'articles.description': 'Le catalogue produits arrive au sprint 2 : création, prix et codes-barres.',

  'stock.title': 'Stock',
  'stock.description': 'Les niveaux de stock et les mouvements arrivent au sprint 3.',

  'sales.title': 'Ventes',
  'sales.description': 'L’enregistrement des ventes et les tickets arrivent au sprint 4.',

  'more.title': 'Plus',
  'more.account': 'Compte',
  'more.session': 'Session',
  'more.device': 'Appareil',
  'more.version': 'Version',
  'more.network': 'Connexion',
  'more.logoutHint': 'La déconnexion révoque la session sur cet appareil.',
} as const;

export type TranslationKey = keyof typeof fr;
