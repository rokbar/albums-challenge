import { useEffect, useState } from 'react';
import { Observable, Subscription } from 'rxjs';


function useObservable(observable$: Observable<any>, initialState: any) {
  let subscription: Subscription;
  const [state, setState] = useState(initialState); 

  useEffect(() => {
    subscription = observable$.subscribe((newState: any) => {
      setState(newState);
    });

    return () => {
      subscription.unsubscribe();
    }
  }, []);

  return state;
}

export default useObservable;
