import { NovaProvider } from '@/lib/nova/store'
import { Workspace } from '@/components/nova/workspace'

export default function Page() {
  return (
    <NovaProvider>
      <Workspace />
    </NovaProvider>
  )
}
