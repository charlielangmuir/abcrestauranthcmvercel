//this file lets us globally import FontAwesome icons without having to import them in every file
//instead just import import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; at the top of a component
//then you can use <FontAwesomeIcon icon="fa-solid fa-user" /> anywhere in your app without importing the icon again

import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faCalendar, 
  faClock, 
  faFileAlt, 
  faBell,
  faRobot,
  faDollarSign,
  faArrowLeft,
  faChevronLeft,
  faChevronRight,
  faUsers,
  faMoneyBill,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faCalendar,
  faClock,
  faFileAlt,
  faBell,
  faRobot,
  faDollarSign,
  faArrowLeft,
  faChevronLeft,
  faChevronRight,
  faUsers,
  faMoneyBill,
  faChartLine
);