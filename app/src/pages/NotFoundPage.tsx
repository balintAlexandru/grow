import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader/PageHeader'

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Pagina nu există" description="Se pare că ai ajuns într-un loc necunoscut." />
      <Link className="button" to="/">
        Înapoi acasă
      </Link>
    </>
  )
}
