import { useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { observer } from 'mobx-react-lite'
import { Button, Form, Modal, Input } from 'ui'
import { PermissionAction } from '@supabase/shared-types/out/constants'

import { useStore, checkPermissions } from 'hooks'
import { delete_ } from 'lib/common/fetch'
import { API_URL } from 'lib/constants'

const MigrateOrganizationBillingButton = observer(() => {
  const router = useRouter()
  const { app, ui } = useStore()

  const { slug: orgSlug, name: orgName } = ui.selectedOrganization || {}

  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')

  const canDeleteOrganization = checkPermissions(PermissionAction.UPDATE, 'organizations')

  const onValidate = (values: any) => {
    const errors: any = {}
    if (!values.orgName) {
      errors.orgName = 'Enter the name of the organization.'
    }
    if (values.orgName !== orgSlug) {
      errors.orgName = 'Value entered does not match the value above.'
    }
    return errors
  }

  const onConfirmDelete = async (values: any, { setSubmitting }: any) => {
    if (!canDeleteOrganization) {
      return ui.setNotification({
        category: 'error',
        message: 'You do not have the required permissions to delete this organization',
      })
    }

    setSubmitting(true)
    const response = await delete_(`${API_URL}/organizations/${orgSlug}`)
    if (response.error) {
      ui.setNotification({
        category: 'error',
        message: `Failed to delete organization: ${response.error.message}`,
      })
      setSubmitting(false)
    } else {
      app.onOrgDeleted(ui.selectedOrganization)
      setSubmitting(false)
      router.push('/')
      ui.setNotification({
        category: 'success',
        message: `Successfully deleted ${orgName}`,
      })
    }
  }

  return (
    <>
      <div>
        <Button loading={!orgSlug} onClick={() => setIsOpen(true)} type="primary">
          Migrate organization
        </Button>
      </div>
      <Modal
        closable
        hideFooter
        size="large"
        visible={isOpen}
        onCancel={() => setIsOpen(false)}
        header={
          <div className="flex items-baseline gap-2">
            <h5 className="text-sm text-scale-1200">Migrate organization</h5>
          </div>
        }
      >
        <Form
          validateOnBlur
          initialValues={{ orgName: '' }}
          onSubmit={onConfirmDelete}
          validate={onValidate}
        >
          {({ isSubmitting }: { isSubmitting: boolean }) => (
            <div className="space-y-4 py-3">
              <Modal.Content>
                ads
              </Modal.Content>
              <Modal.Content>
                <Button block size="small" type="primary" htmlType="submit" loading={isSubmitting}>
                  I understand, migrate this organization
                </Button>
              </Modal.Content>
            </div>
          )}
        </Form>
      </Modal>
    </>
  )
})

export default MigrateOrganizationBillingButton
