import './App.css'

function App() {

  return (
    <div>
    <header>
        <h1 className="title header">TRIVL</h1>
    </header>
    <div className="modal" id="trivlModal">
        <div className="modal-background"></div>
        <div className="modal-content">
            <div className="box">
                <p>About TRIVL</p>
                <img src="./assets/images/trivl_modal_test.png" alt=""></img>
                <div>
                    Lorem ipsum dolor sit amet...
                </div>
            </div>
        </div>

    </div>
    <div className="modal" id="timerModal">
        <div className="modal-background"></div>
        <div className="modal-content">
            <div className="box">

                <p id="timer"></p>
            </div>
            <p className="return">
                <button>
              <a href="./results.html">See Your Results</a>
                    </button>
            </p>

        </div>

        <button className="modal-close is-large" aria-label="close"></button>
    </div>

    <div className="container is-fluid">
        <div id="carousel-demo" className="carousel">
        </div>
    </div>
    <div className="submit-button">
        <button id="submit-quiz" className="button is-black">Submit Quiz</button>
    </div>
    <h2 id="timer"></h2>
</div>
  )
}

export default App
