import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';

configure({adapter: new Adapter()});

chai.config.truncateThreshold = 0;

global.expect = expect;
global.sinon = sinon;

chai.use(sinonChai);