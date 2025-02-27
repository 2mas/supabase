import { find } from 'lodash'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'

import { useParams } from 'common'
import { StorageLayout } from 'components/layouts'
import StorageBucketsError from 'components/layouts/StorageLayout/StorageBucketsError'
import { StorageExplorer } from 'components/to-be-cleaned/Storage'
import { useBucketsQuery } from 'data/storage/buckets-query'
import { useFlag, useStore } from 'hooks'
import { post } from 'lib/common/fetch'
import { API_URL, PROJECT_STATUS } from 'lib/constants'
import { NextPageWithLayout } from 'types'

const PageLayout: NextPageWithLayout = () => {
  const { ref, bucketId } = useParams()

  const { ui } = useStore()
  const project = ui.selectedProject

  const { data, isSuccess, isError, error } = useBucketsQuery({ projectRef: ref })
  const buckets = data ?? []

  const kpsEnabled = useFlag('initWithKps')

  useEffect(() => {
    if (project && project.status === PROJECT_STATUS.INACTIVE) {
      post(`${API_URL}/projects/${ref}/restore`, { kps_enabled: kpsEnabled })
    }
  }, [project])

  if (!project) return <div></div>

  const bucket = find(buckets, { id: bucketId })

  return (
    <div className="storage-container flex flex-grow p-4">
      {isError && <StorageBucketsError error={error as any} />}

      {isSuccess ? (
        !bucket ? (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-sm text-scale-1100">Bucket {bucketId} cannot be found</p>
          </div>
        ) : (
          // @ts-ignore
          <StorageExplorer bucket={bucket} />
        )
      ) : (
        <div />
      )}
    </div>
  )
}

PageLayout.getLayout = (page) => <StorageLayout title="Buckets">{page}</StorageLayout>

export default observer(PageLayout)
