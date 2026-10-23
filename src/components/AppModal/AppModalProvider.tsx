import React, {useEffect, useMemo, useState} from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useAppTheme} from '../../hooks/useAppTheme';
import {AppButton} from '../AppButton';
import {
  AppAlertButton,
  AppAlertRequest,
  hideAppAlert,
  setAppAlertListener,
} from './appAlert';
import {useAppModalStyles} from './AppModal.styles';

function resolveButtons(buttons?: AppAlertButton[]): AppAlertButton[] {
  if (!buttons || buttons.length === 0) {
    return [{text: 'OK', style: 'default'}];
  }
  return buttons;
}

function buttonVariant(
  style: AppAlertButton['style'],
  isPrimary: boolean,
): 'primary' | 'secondary' | 'ghost' {
  if (style === 'cancel') {
    return 'ghost';
  }
  if (style === 'destructive') {
    return 'secondary';
  }
  return isPrimary ? 'primary' : 'secondary';
}

export function AppModalProvider({children}: {children: React.ReactNode}) {
  const {colors} = useAppTheme();
  const styles = useAppModalStyles();
  const [request, setRequest] = useState<AppAlertRequest | null>(null);

  useEffect(() => {
    setAppAlertListener(setRequest);
    return () => setAppAlertListener(null);
  }, []);

  const buttons = useMemo(
    () => resolveButtons(request?.buttons),
    [request?.buttons],
  );

  const primaryIndex = useMemo(() => {
    const destructive = buttons.findIndex(b => b.style === 'destructive');
    if (destructive >= 0) {
      return destructive;
    }
    const def = buttons.findIndex(
      b => !b.style || b.style === 'default',
    );
    if (def >= 0) {
      return def;
    }
    return buttons.length - 1;
  }, [buttons]);

  const onPressButton = (button: AppAlertButton) => {
    hideAppAlert();
    button.onPress?.();
  };

  return (
    <>
      {children}
      <Modal
        visible={Boolean(request)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          const cancel = buttons.find(b => b.style === 'cancel');
          if (cancel) {
            onPressButton(cancel);
          } else {
            hideAppAlert();
          }
        }}>
        <View style={styles.root}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            style={[styles.backdrop, {backgroundColor: colors.overlay}]}
            onPress={() => {
              const cancel = buttons.find(b => b.style === 'cancel');
              if (cancel) {
                onPressButton(cancel);
              }
            }}
          />
          <View style={styles.center} pointerEvents="box-none">
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceSolid,
                  borderColor: colors.borderSoft,
                  shadowColor: colors.cardShadow,
                  shadowOpacity: 0.35,
                  shadowRadius: 24,
                  shadowOffset: {width: 0, height: 12},
                  elevation: 12,
                },
              ]}>
              <LinearGradient
                colors={[
                  colors.primaryAccent,
                  colors.accentWarm,
                  colors.accentRose,
                ]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.accent}
              />
              <View style={styles.body}>
                <Text style={[styles.title, {color: colors.primaryText}]}>
                  {request?.title}
                </Text>
                {request?.message ? (
                  <Text
                    style={[styles.message, {color: colors.secondaryText}]}>
                    {request.message}
                  </Text>
                ) : null}
                <View style={styles.actions}>
                  {buttons.map((button, index) => {
                    const isDestructive = button.style === 'destructive';
                    const variant = buttonVariant(
                      button.style,
                      index === primaryIndex && !isDestructive,
                    );
                    return (
                      <AppButton
                        key={`${button.text}-${index}`}
                        label={button.text}
                        variant={isDestructive ? 'secondary' : variant}
                        labelColor={
                          isDestructive ? colors.accentRose : undefined
                        }
                        onPress={() => onPressButton(button)}
                        style={
                          isDestructive
                            ? {
                                borderColor: `${colors.accentRose}88`,
                                backgroundColor: colors.errorSoft,
                              }
                            : undefined
                        }
                      />
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
