import { Subscriber } from 'rxjs';

const subscriber = new Subscriber(
  value => value,
  error => console.log(`error: ${error}`),
  () => console.log('completed')
);

export default subscriber;
