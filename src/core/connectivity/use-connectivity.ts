import { useNetInfo } from '@react-native-community/netinfo';

export interface ConnectivityState {
  isOnline: boolean;
  isKnown: boolean;
}

/**
 * Connectivité observée par NetInfo.
 * `isInternetReachable` peut valoir `null` au démarrage : on ne déclare
 * « hors ligne » que sur une valeur explicitement fausse.
 */
export function useConnectivity(): ConnectivityState {
  const netInfo = useNetInfo();

  const isKnown = netInfo.isConnected !== null || netInfo.isInternetReachable !== null;
  const isOnline = netInfo.isConnected !== false && netInfo.isInternetReachable !== false;

  return { isOnline, isKnown };
}
