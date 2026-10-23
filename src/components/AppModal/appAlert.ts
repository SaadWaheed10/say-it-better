export type AppAlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppAlertButton = {
  text: string;
  style?: AppAlertButtonStyle;
  onPress?: () => void;
};

export type AppAlertRequest = {
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
};

type Listener = (request: AppAlertRequest | null) => void;

let listener: Listener | null = null;

export function setAppAlertListener(next: Listener | null): void {
  listener = next;
}

/** Drop-in replacement for React Native `Alert.alert` with themed UI. */
export function showAppAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
): void {
  if (!listener) {
    if (__DEV__) {
      console.warn(
        '[SayItBetter] showAppAlert called before AppModalProvider mounted.',
      );
    }
    return;
  }
  listener({title, message, buttons});
}

export function hideAppAlert(): void {
  listener?.(null);
}
