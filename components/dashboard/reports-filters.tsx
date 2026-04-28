'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, RotateCcw } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns'

interface ReportsFiltersProps {
  desde: string
  hasta: string
  estado: string
}

export function ReportsFilters({ desde, hasta, estado }: ReportsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard/reportes?${params.toString()}`)
  }

  const applyPreset = (preset: string) => {
    const today = new Date()
    let newDesde: string
    let newHasta: string

    switch (preset) {
      case 'mes-actual':
        newDesde = format(startOfMonth(today), 'yyyy-MM-dd')
        newHasta = format(endOfMonth(today), 'yyyy-MM-dd')
        break
      case 'mes-anterior':
        newDesde = format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd')
        newHasta = format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd')
        break
      case 'ultimos-3-meses':
        newDesde = format(startOfMonth(subMonths(today, 2)), 'yyyy-MM-dd')
        newHasta = format(endOfMonth(today), 'yyyy-MM-dd')
        break
      case 'este-anio':
        newDesde = format(startOfYear(today), 'yyyy-MM-dd')
        newHasta = format(today, 'yyyy-MM-dd')
        break
      default:
        return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set('desde', newDesde)
    params.set('hasta', newHasta)
    router.push(`/dashboard/reportes?${params.toString()}`)
  }

  const resetFilters = () => {
    router.push('/dashboard/reportes')
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applyPreset('mes-actual')}
            >
              Este Mes
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applyPreset('mes-anterior')}
            >
              Mes Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applyPreset('ultimos-3-meses')}
            >
              Ultimos 3 Meses
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applyPreset('este-anio')}
            >
              Este Anio
            </Button>
          </div>

          <div className="h-px bg-border lg:h-8 lg:w-px" />

          {/* Date Range */}
          <div className="grid gap-4 sm:grid-cols-2 lg:flex lg:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="desde" className="text-xs">Desde</Label>
              <Input
                id="desde"
                type="date"
                value={desde}
                onChange={(e) => updateFilters('desde', e.target.value)}
                className="w-full lg:w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hasta" className="text-xs">Hasta</Label>
              <Input
                id="hasta"
                type="date"
                value={hasta}
                onChange={(e) => updateFilters('hasta', e.target.value)}
                className="w-full lg:w-40"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs">Estado</Label>
            <Select value={estado} onValueChange={(v) => updateFilters('estado', v)}>
              <SelectTrigger className="w-full lg:w-44">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="pending_payment">Pendiente Pago</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
                <SelectItem value="no_show">No Asistio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset */}
          <Button variant="ghost" size="icon" onClick={resetFilters} title="Limpiar filtros">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
