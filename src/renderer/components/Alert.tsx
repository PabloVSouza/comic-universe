interface AlertButton {
  label: string
  action: () => {}
}

interface IAlertProps {
  title?: string
  message?: string
  buttons?: AlertButton[]
}

import Cover from 'components/Cover'

const Alert = ({ title, message, buttons }: IAlertProps) => {
  return (
    <Cover className="h-screen w-screen fixed top-0 left-0" visible>
      <div></div>
    </Cover>
  )
}

export const confirmAlert = ({ title, message, buttons }: IAlertProps) => {
  return <Alert title={title} message={message} buttons={buttons} />
}
