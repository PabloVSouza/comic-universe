import { ReactNode, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import usePersistStore from 'store/usePersistStore'
import Button from './Button'
import Cover from './Cover'

interface AlertButton {
  label: string
  action?: () => void
}

interface AlertProps {
  title?: string
  message?: string
  buttons?: AlertButton[]
  className?: string
  visible?: boolean
}

const Alert = ({ title, message, buttons, className, visible }: AlertProps) => {
  const [currentVisible, setCurrentVisible] = useState(visible)

  useEffect(() => {
    if (visible === undefined) setCurrentVisible(true)
  }, [])

  useEffect(() => {
    if (visible !== undefined) setCurrentVisible(visible)
  }, [visible])

  return (
    <Cover
      className={classNames(
        className,
        'h-screen w-screen fixed top-0 left-0 flex items-center justify-center z-[999999]'
      )}
      visible={currentVisible}
    >
      <div className="bg-default p-5 rounded-lg shadow-lg max-w-sm w-full">
        {title && <h2 className="text-2xl text-text-default  mb-4">{title}</h2>}
        {message && <p className="mb-4 text-text-default">{message}</p>}
        <div className="flex justify-end space-x-2">
          {buttons?.map((button, index) => (
            <Button
              key={index}
              onClick={button.action}
              theme={index === 0 ? 'secondary' : 'primary'}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>
    </Cover>
  )
}

let showAlert: (props: AlertProps) => void

export const confirmAlert = (props: AlertProps) => {
  if (showAlert) {
    showAlert(props)
  }
}

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertProps, setAlertProps] = useState<AlertProps | null>(null)
  const { t } = useTranslation()

  const { theme } = usePersistStore()

  showAlert = (props: AlertProps) => {
    setAlertProps(props)
  }

  const handleClose = () => {
    setAlertProps({ ...alertProps, visible: false })
    setTimeout(() => {
      setAlertProps(null)
    }, 500)
  }

  const defaultButton = [
    { label: t('General.alertConfirmButton'), action: handleClose }
  ] as AlertButton[]

  const buttons =
    alertProps?.buttons?.map((button) => {
      return {
        ...button,
        action: () => {
          if (button.action) button.action()
          handleClose()
        }
      }
    }) ?? defaultButton

  return (
    <>
      {children}
      {alertProps &&
        createPortal(
          <Alert {...alertProps} buttons={buttons} className={theme.theme} />,
          document.body
        )}
    </>
  )
}
