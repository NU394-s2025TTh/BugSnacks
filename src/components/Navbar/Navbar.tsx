import './Navbar.css';

function Navbar() {
  return (
    <div className="navbar">
      <div className="add">
        <img src="src/assets/add.svg" alt="add symbol" />
      </div>
      <div className="logo">
        <img src="src/assets/logo.svg" alt="logo" />
      </div>
      <div className="chat">
        <img src="src/assets/chat.svg" alt="chat" />
      </div>
    </div>
  );
}

export default Navbar;
