"use client"

import type { Customer } from "@/lib/data/customers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface CustomerFinancingProps {
  customer: Customer
}

export function CustomerFinancing({ customer }: CustomerFinancingProps) {
  if (!customer.financingAvailable) {
    return null
  }

  const utilisationPercentage = customer.financingLimit > 0 
    ? (customer.financingUsed / customer.financingLimit) * 100 
    : 0
  
  const availableBalance = customer.financingLimit - customer.financingUsed

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount)
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Estado de Financiamiento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 text-xs font-medium mb-1">LÍMITE DISPONIBLE</p>
            <p className="font-bold text-lg">{formatCurrency(customer.financingLimit)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs font-medium mb-1">FINANCIAMIENTO USADO</p>
            <p className="font-bold text-lg text-orange-600">{formatCurrency(customer.financingUsed)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs font-medium mb-1">BALANCE DISPONIBLE</p>
            <p className={`font-bold text-lg ${availableBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(Math.max(0, availableBalance))}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Utilización</span>
            <span className="font-semibold">{utilisationPercentage.toFixed(1)}%</span>
          </div>
          <Progress 
            value={Math.min(utilisationPercentage, 100)} 
            className="h-2"
          />
        </div>

        {customer.financingInterestRate > 0 && (
          <div className="pt-2 border-t text-sm">
            <p className="text-gray-600">Tasa de Interés: <span className="font-semibold">{customer.financingInterestRate.toFixed(2)}%</span></p>
          </div>
        )}

        {utilisationPercentage >= 100 && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            ⚠️ El cliente ha alcanzado su límite de financiamiento
          </div>
        )}
      </CardContent>
    </Card>
  )
}
