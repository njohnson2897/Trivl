function Results() {
    return (
        <div>
        <div className="modal" id="trivlModal">
  <div className="modal-background"></div>
  <div className="modal-content">
      {/* <!-- Your content here --> */}
      <div className="box">
          <p><strong>You have completed today's quiz!</strong></p>
          <div id="results-container">
            {/* <!-- User data from quiz goes here {score/10}--> */}
          </div>
      </div>
  </div>
  <button className="modal-close is-large" aria-label="close"></button>
</div>

    <div className="card container is-fluid"> 
        <div className="card-content">
          <p className="card-title">
            Thanks for playing TRIVL
          </p>
          <p className="subtitle">
            {/* <!-- link back to landing page --> */}
            <a href="./index.html">Play Again Tomorrow</a>
          </p>
        </div>
       
<button id="openModalBtn">Answer Key</button>

{/* <!-- The Modal --> */}
<div id="myModal" className="modal">

  {/* <!-- Modal content --> */}
  <div className="modal-content">
    <span className="close">&times;</span>
    <p><strong>Answer Key</strong></p>
    <div>
      <ul id="answerList"></ul>
    </div>
  </div>
</div>
        <footer className="card-footer">
          <p className="card-footer-item">
            <span>
              <a href="https://twitter.com">Share on Twitter</a>
            </span>
          </p>
          <p className="card-footer-item">
            <span>
              <a href="https://facebook.com">Share on Facebook</a>
            </span>
          </p>
        </footer>
      </div>
      </div>
    );
}

export default Results;