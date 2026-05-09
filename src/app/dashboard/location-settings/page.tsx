'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { adminApi } from '@/lib/api/admin'
import type { UniversitySettings } from '@/lib/types'
import toast from 'react-hot-toast'
import { MapPin, Save } from 'lucide-react'

const UniversityLocationMap = dynamic(
  () =>
    import('./UniversityLocationMap').then((mod) => mod.UniversityLocationMap),
  {
    ssr: false,
  }
)

export default function LocationSettingsPage() {
  const [settings, setSettings] = useState<UniversitySettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const data = await adminApi.getUniversitySettings()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load university settings', error)
      toast.error('Failed to load location settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setIsSaving(true)
      const payload: Partial<UniversitySettings> = {
        name: settings.name,
        latitude: settings.latitude,
        longitude: settings.longitude,
        service_radius_km:
          settings.service_radius_km ?? settings.serviceRadiusKm ?? 1,
        location_verification_enabled:
          settings.location_verification_enabled ??
          settings.locationVerificationEnabled ??
          true,
      }

      const updated = await adminApi.updateUniversitySettings(payload)
      setSettings(updated)
      toast.success('Location settings updated')
    } catch (error) {
      console.error('Failed to save university settings', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const radiusKm =
    settings.service_radius_km ?? settings.serviceRadiusKm ?? 1.0

  const isVerificationEnabled =
    settings.location_verification_enabled ??
    settings.locationVerificationEnabled ??
    true

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-primary" />
            University Location Settings
          </h1>
          <p className="text-gray-500 mt-1 max-w-2xl">
            Configure the university center location and service radius. Students will only be able to place
            orders when they are inside this area.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University Name
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) =>
                setSettings({ ...settings, name: e.target.value })
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
              placeholder="e.g. University of Lahore"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={settings.latitude}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    latitude: parseFloat(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={settings.longitude}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    longitude: parseFloat(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Radius (km)
            </label>
            <input
              type="number"
              min={0.1}
              step="0.1"
              value={radiusKm}
              onChange={(e) => {
                const value = Math.max(0.1, parseFloat(e.target.value) || 0.1)
                setSettings({
                  ...settings,
                  serviceRadiusKm: value,
                  service_radius_km: value,
                })
              }}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              Students inside this radius will be allowed to place orders.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  locationVerificationEnabled: !isVerificationEnabled,
                  location_verification_enabled: !isVerificationEnabled,
                })
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isVerificationEnabled ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isVerificationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">
                Enable location verification
              </span>
              <span className="text-xs text-gray-500">
                When disabled, students can place orders from anywhere.
              </span>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Map preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Coverage Area Preview
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              The blue circle shows the area where students can place orders.
            </p>
          </div>
          <UniversityLocationMap
            latitude={settings.latitude}
            longitude={settings.longitude}
            radiusKm={radiusKm}
          />
        </div>
      </div>
    </div>
  )
}


