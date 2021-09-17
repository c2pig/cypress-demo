
const baseUrl = Cypress.config().baseUrl;

// Note: This a global catch, risky to add this to ignore unexpect UI error
Cypress.on('uncaught:exception', (err) => {
  return false
})

describe(`When visit ${baseUrl}`, () => {

  beforeEach(() => {
    cy.setCookie('rbzid', Cypress.config().securityCookie);
    cy.visit('/')
  })

  it('[User] homepage should render UI components', () => {
    cy.get('div[class="close"]').click();
    cy.contains('a', 'View')
      .should('have.attr', 'href', 'http://play.google.com/store/apps/details?id=com.celcom.mycelcom')
    cy.get('a[class="smartbanner-close"]').click(); //check playstore link before close top banner
    cy.contains('Products').click();
    cy.contains('Shop').click();
    cy.contains('Lifestyle').click();
    cy.contains('Support').click();
    cy.contains('Our Network').click();
  });

  it('[SEO] homepage should not redirect to /personal', () => {
    cy.url().should('be.equal', `${baseUrl}/personal`);
  });

  it('[SEO] homepage(/personal) should not redirect', () => { cy.request({
      url: '/personal',
      followRedirect: true,
    }).then((resp) => {
      expect(resp.status).to.eq(200)
    });
  });

  it('[SEO] homepage should render SEO key elements', () => {
    const assertByDomExist = (dom, selector) => {
      expect(Cypress.dom.isElement(dom.querySelector(selector))).eq(true);
    }

    // use cy.request() (rather than cy.get) to simulate what google bot will see
    cy.request({
      url: '/',
      followRedirect: false,
    }).then(async(resp) => {
      expect(resp.status).to.eq(200);
      
      // ensure <html>..</html> is parsable by DOM
      const dom = new DOMParser(resp.body).parseFromString(resp.body, 'text/html');
      expect(Cypress.dom.isDom(dom)).eq(true)

      // check title render as expected
      expect(dom.title).eq('Device bundles, postpaid, prepaid, broadband plans & lifestyle Walla add-ons | Celcom');

      // check title render as expected
      assertByDomExist(dom, 'meta[property="fb:app_id"]');
      assertByDomExist(dom, 'meta[property="twitter:image"]');
      assertByDomExist(dom, 'meta[property="og:image"]');
      assertByDomExist(dom, 'meta[name="robots"][content="index, follow"]');
      assertByDomExist(dom, 'meta[name="keywords"]');
      assertByDomExist(dom, 'meta[name="description"]');
    });
  }); 
})
