import { Link } from 'react-router-dom';

function Header() {
    return (
    <header>
        <div className='header'>
        <Link to='/'>TRIVL</Link>
        </div>
    </header>
    )
}

export default Header;