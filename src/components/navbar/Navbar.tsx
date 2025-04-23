/*
 * Defines a navigation bar component for the application.
 * It imports styling and SVG assets for add, chat, and logo icons,
 * then renders a container with:
 *   - a link to the add-bug page
 *   - a link to the home page via the logo
 *   - a static chat icon
 */
// Most comments made in the file were done by OpenAI's o4-mini model

// THIS CODE IS NOT BEING USED IN THE PROJECT

import './Navbar.css';

// Import SVG assets for interactive icons and the logo
import add from '../../assets/add.svg';
import chat from '../../assets/chat.svg';
import logo from '../../assets/logo.svg';

// Functional component that renders the navbar
function Navbar() {
  return (
    <div className="navbar">
      {/* Wrapper for the add-bug link */}
      <div className="add">
        {/* Link uses window.origin to construct a full URL to /addbug */}
        <a href={`${window.origin}/addbug`}>
          <img src={add} alt="add symbol" />
        </a>
      </div>
      {/* Wrapper for the home link via logo */}
      <div className="logo">
        {/* Link navigates to the application's root */}
        <a href={`${window.origin}`}>
          <img src={logo} alt="logo" />
        </a>
      </div>
      {/* Chat icon displayed without navigation */}
      <div className="chat">
        <img src={chat} alt="chat" />
      </div>
    </div>
  );
}

export default Navbar;
