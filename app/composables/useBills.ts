import { isNil } from 'jalutils'

export interface Bill {
  id: number
  name: string
  desc: string
  amount: number
  monthly_amount: number
  count: number
  started_at: string
  user_id: string
}

export interface BillFormData {
  name: string
  desc: string
  amount: number
  count: number
  started_at: string
}

export const useBills = () => {
  const supabase = useSupabaseClient<any>()
  const user = useSupabaseUser()
  const bills = ref<Bill[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Fetch all bills
  const fetchBills = async () => {
    loading.value = true
    error.value = null
    
    try {
      if (isNil(user.value?.id)) {
        bills.value = []
        loading.value = false
        return
      }

      const { data, error: fetchError } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.value.id)
        .order('started_at', { ascending: false })
      
      if (fetchError) throw fetchError
      bills.value = data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching bills:', err)
    } finally {
      loading.value = false
    }
  }

  // Create a new bill
  const createBill = async (billData: BillFormData) => {
    loading.value = true
    error.value = null

    try {
      if (isNil(user.value?.id)) {
        throw new Error('User must be authenticated to create bills')
      }

      const monthly_amount = Math.round(billData.amount / billData.count)
      
      const { data, error: createError } = await supabase
        .from('bills')
        .insert([
          {
            ...billData,
            monthly_amount,
            user_id: user.value.id
          }
        ])
        .select()
        .single()

      if (createError) throw createError
      
      // Refresh bills list
      await fetchBills()
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating bill:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update an existing bill
  const updateBill = async (id: number, billData: Partial<BillFormData>) => {
    loading.value = true
    error.value = null

    try {
      const updateData: any = { ...billData }
      
      // Recalculate monthly_amount if amount or count changed
      if (!isNil(billData.amount) && !isNil(billData.count)) {
        updateData.monthly_amount = Math.round(billData.amount / billData.count)
      }

      const { data, error: updateError } = await supabase
        .from('bills')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Refresh bills list
      await fetchBills()
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating bill:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete a bill
  const deleteBill = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('bills')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      // Refresh bills list
      await fetchBills()
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting bill:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Calculate monthly payments for all bills
  const getMonthlyPayments = () => {
    const monthlyPayments: Record<string, number> = {}

    bills.value.forEach(bill => {
      const startDate = new Date(bill.started_at)
      
      for (let i = 0; i < bill.count; i++) {
        const paymentDate = new Date(startDate)
        paymentDate.setMonth(startDate.getMonth() + i)
        
        const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyPayments[monthKey]) {
          monthlyPayments[monthKey] = 0
        }
        monthlyPayments[monthKey] += bill.monthly_amount
      }
    })

    return monthlyPayments
  }

  // Group bills by year
  const getBillsByYear = () => {
    const billsByYear: Record<string, Bill[]> = {}
    
    bills.value.forEach(bill => {
      const startDate = new Date(bill.started_at)
      const startYear = startDate.getFullYear()
      
      // Calculate all years this bill spans
      const endDate = new Date(startDate)
      endDate.setMonth(startDate.getMonth() + bill.count - 1)
      const endYear = endDate.getFullYear()
      
      // Add bill to all years it spans
      for (let year = startYear; year <= endYear; year++) {
        const yearString = year.toString()
        if (!billsByYear[yearString]) {
          billsByYear[yearString] = []
        }
        billsByYear[yearString].push(bill)
      }
    })

    // Sort years in descending order
    const sortedYears = Object.keys(billsByYear).sort((a, b) => parseInt(b) - parseInt(a))
    const sortedBillsByYear: Record<string, Bill[]> = {}
    
    sortedYears.forEach(year => {
      const yearBills = billsByYear[year]
      if (yearBills) {
        // Remove duplicates (in case same bill appears multiple times)
        const uniqueBills = Array.from(new Map(yearBills.map(bill => [bill.id, bill])).values())
        sortedBillsByYear[year] = uniqueBills.sort((a, b) => 
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
        )
      }
    })

    return sortedBillsByYear
  }

  return {
    bills: readonly(bills),
    loading: readonly(loading),
    error: readonly(error),
    fetchBills,
    createBill,
    updateBill,
    deleteBill,
    getMonthlyPayments,
    getBillsByYear
  }
}