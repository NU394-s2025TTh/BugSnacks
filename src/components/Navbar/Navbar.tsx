import './Navbar.css';

import add from '../../assets/add.svg';
import chat from '../../assets/chat.svg';
import logo from '../../assets/logo.svg';

function Navbar() {
  return (
    <div className="navbar">
      <div className="add">
        <a href={`${window.location}addbug`}>
          <img src={add} alt="add symbol" />
        </a>
      </div>
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>
      <div className="chat">
        <img src={chat} alt="chat" />
      </div>
    </div>
  );
}

export default Navbar;
