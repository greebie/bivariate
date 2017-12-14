import { ProvinceCAPage } from './app.po';

describe('province-ca App', () => {
  let page: ProvinceCAPage;

  beforeEach(() => {
    page = new ProvinceCAPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
