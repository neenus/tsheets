import TimeEntryCard from './components/TimeEntryCard.jsx';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto text-center my-2">
        <h1 className="text-2xl font-bold">Time Sheet Application</h1>
      </div>
    </header>
  );
};


function App() {
  return (
    <>
      <Header />
      <TimeEntryCard />
    </>
  )
}

export default App
