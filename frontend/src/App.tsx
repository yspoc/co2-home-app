import './index.css'
import AnnualInputTable from './components/AnnualInputTable.tsx'

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        家庭用 CO2 排出量計算アプリ
      </h1>
      <AnnualInputTable />
    </div>
  )
}

export default App