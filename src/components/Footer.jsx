import facebook from '../assets/fb.png';
import twitter from '../assets/twitter.png';
import instagram from '../assets/instagram.png';
import github from '../assets/gh.png';

function Footer() {
    return (
      <section className="footer pt-2">
        <div>
          <div className="footer-container">    
            <div>
              <div className="row">
                <div className="col-md-4 col-lg-3">
                <div>
              <div className='mb-2'>
                <span>Want to Spread the Word? Share On Social Media!</span>
              </div>
              <div>
                <a href="https://www.facebook.com/" target="blank">
                  <img src={facebook} alt="facebook logo" height='40px' className='mx-1'/>
                </a>
                <a href="https://twitter.com/" target="blank">
                  <img src={twitter} alt="twitter logo" height='40px' className='mx-1'/>
                </a>
                <a href="https://www.instagram.com/" target="blank">
                  <img src={instagram} alt="instagram logo" height='40px' className='mx-1'/>
                </a>
              </div>
            </div>
                </div>
           
    
                <div className="col-md-4 col-lg-3 offset-lg-2">
                  <h5>
                    <div>
                      <a className='text-dark' href="https://github.com/njohnson2897/Trivl" target="blank">
                        <img src={github} alt="github logo"/>Github
                      </a>
                      </div>
                  </h5>
                  <h6>Designed by: Nate Johnson, Ben Mallar, Robin Langton, and Bryan LeBeuf</h6>
                </div>
    
                <div className="col-md-4 col-lg-3  offset-lg-1">
                  <div>
                    <h5>
                      Contact Us
                    </h5>
                    <div className="form" id='bottom'>
                      <form>
                          <div className="form-group">
                              <textarea type="email" className="form-control form-control-sm" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Email" required rows="1"></textarea>    
    
                              <textarea name="contact-message" id="contact-message" cols="30" rows="1" className="form-control form-control-sm" placeholder="Message"></textarea>
                          <button type="submit" className="btn btn-dark btn-block btn-sm my-2">Send Message</button>
                        </div>
                      </form>
                  </div>
                  </div>
                </div>
              </div>
            </div>
    
          </div>
        </div>
      </section>
        );
}

export default Footer;