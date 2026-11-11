import Layout from './components/Layout.jsx'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import MainContent from './components/MainContent.jsx'
import Footer from './components/Footer.jsx'
function App() {
  const siteTitle = 'Мой сайт на React'
  const userName = 'Студент ОмГТУ'
 
  return (
    <Layout siteTitle={siteTitle}>
      <Header title={siteTitle} userName={userName} />
      <Sidebar items={['Главная', 'О нас', 'Услуги', 'Контакты']} />
      <MainContent>
  <h1>ЛР2</h1>
  <p>React и CSS Grid.</p>

  <ul>
    <li>Создание компонентов</li>
    <li>Работа с props</li>
    <li>Передача children</li>
  </ul>
      </MainContent>
      <Footer year={new Date().getFullYear()} />
    </Layout>  )
} 
export default App

