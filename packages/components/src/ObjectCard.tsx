import { useEffect, useRef, useState } from 'react'
import type { Computer, TXORecord } from '@bitcoin-computer/lib'
import { protoConstructorName, refineObjectClassName } from './common/className'
import { isDecryptionFailure } from './common/transition'
import { limitConcurrency } from './common/limitConcurrency'
import { ObjectStateTable } from './ObjectStateTable'

function truncateMiddle(value: string, head = 6, tail = 4): string {
  if (!value || value.length <= head + tail + 1) return value
  return `${value.slice(0, head)}…${value.slice(-tail)}`
}

function truncateRev(rev: string): string {
  const [txId, vout] = rev.split(':')
  if (!txId) return rev
  return `${truncateMiddle(txId, 8, 6)}:${vout ?? '0'}`
}

export type ObjectCardProps = {
  record: TXORecord
  computer: Computer
  progressiveSync?: boolean
}

export function ObjectCard({ record, computer, progressiveSync = true }: ObjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [syncedObject, setSyncedObject] = useState<unknown>(null)
  const [encrypted, setEncrypted] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [objectClass, setObjectClass] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!progressiveSync) return undefined
    const el = cardRef.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '120px', threshold: 0.01 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [progressiveSync])

  useEffect(() => {
    if (!progressiveSync || !inView) return undefined
    if (syncedObject !== null) return undefined

    let cancelled = false
    setSyncing(true)
    setEncrypted(false)

    limitConcurrency(() => computer.sync(record.rev))
      .then((synced) => {
        if (cancelled) return
        setSyncedObject(synced)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // Keep the card; never show a red error on the gallery.
        if (isDecryptionFailure(err)) setEncrypted(true)
      })
      .finally(() => {
        if (!cancelled) setSyncing(false)
      })

    return () => {
      cancelled = true
    }
  }, [progressiveSync, inView, record.rev, computer, syncedObject])

  useEffect(() => {
    if (syncedObject == null) {
      setObjectClass(undefined)
      return undefined
    }

    const immediate = protoConstructorName(syncedObject)
    setObjectClass(immediate)

    let cancelled = false
    void refineObjectClassName(computer, syncedObject, record.mod).then((refined) => {
      if (!cancelled && refined) setObjectClass(refined)
    })
    return () => {
      cancelled = true
    }
  }, [computer, syncedObject, record.mod])

  const title = objectClass || 'Object'
  const showTitleSkeleton = syncing && syncedObject === null && !encrypted && !objectClass

  return (
    <div
      ref={cardRef}
      className="block w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-600 transition-colors text-left h-full"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {showTitleSkeleton ? (
            <span
              className="inline-block h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse shrink-0"
              aria-hidden="true"
            />
          ) : (
            <span
              className="text-sm font-semibold text-gray-900 dark:text-white truncate min-w-0"
              title={title}
            >
              {title}
            </span>
          )}
          {record.mod ? (
            <span
              className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 font-mono truncate max-w-[40%] shrink"
              title={record.mod}
            >
              {truncateRev(record.mod)}
            </span>
          ) : null}
          {encrypted ? (
            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 shrink-0">
              Encrypted/private
            </span>
          ) : null}
        </div>
        {record.blockHeight != null ? (
          <span className="text-[11px] text-green-700 dark:text-green-400 tabular-nums shrink-0">
            #{record.blockHeight}
          </span>
        ) : (
          <span className="text-[11px] text-amber-700 dark:text-amber-400 shrink-0">Mempool</span>
        )}
      </div>

      <p
        className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate"
        title={record.rev}
      >
        {truncateRev(record.rev)}
      </p>

      {(syncing || syncedObject !== null || encrypted) && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-1.5 mt-1.5">
          {syncing && syncedObject === null && !encrypted ? (
            <div className="animate-pulse space-y-1" aria-hidden="true">
              <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-full" />
              <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-5/6" />
              <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-2/3" />
            </div>
          ) : null}
          {encrypted && syncedObject === null ? (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Encrypted/private</p>
          ) : null}
          {syncedObject !== null ? <ObjectStateTable smartObject={syncedObject} /> : null}
        </div>
      )}
    </div>
  )
}

export function ObjectCardSkeleton() {
  return (
    <div className="block w-full p-3 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 animate-pulse">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/3" />
        <div className="h-3 bg-gray-200 rounded dark:bg-gray-700 w-10" />
      </div>
      <div className="h-3 bg-gray-200 rounded dark:bg-gray-700 w-2/3 mb-2" />
      <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-full" />
    </div>
  )
}
