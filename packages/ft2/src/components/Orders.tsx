import { ComputerContext } from "@bitcoin-computer/components"
import { useContext } from "react"
import { SellOrderTable, SellOrderForm } from "./SellOrders"
import { BuyOrderForm, BuyOrderTable } from "./BuyOrders"

export default function Orders() {
  const computer = useContext(ComputerContext)

  return <div className="container mx-auto p-6">
    <div className="grid grid-cols-2 gap-4 my-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h4 className="text-2xl mb-2 font-bold dark:text-white">New Sell Order</h4>
        <SellOrderForm computer={computer} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h4 className="text-2xl mb-2 font-bold dark:text-white">New Buy Orders</h4>
        <BuyOrderForm computer={computer} />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4  my-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h4 className="text-2xl mb-2 font-bold dark:text-white">Sell Orders</h4>
        <SellOrderTable computer={computer} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h4 className="text-2xl mb-2 font-bold dark:text-white">Buy Orders</h4>
        <BuyOrderTable computer={computer} />
      </div>
    </div>
  </div>
}