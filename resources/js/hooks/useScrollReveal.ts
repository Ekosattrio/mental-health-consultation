import {useEffect,type RefObject} from 'react';
import {revealWhenVisible} from '../utils/revealMotion';

/** Konten tetap terlihat tanpa JS; satu observer dan animasi sekali saat masuk viewport. */
export function useScrollReveal(root: RefObject<HTMLElement | null>) {
  useEffect(()=>{
    if(!root.current)return;
    return revealWhenVisible(Array.from(root.current.querySelectorAll('[data-scroll-reveal]')),{threshold:0.05});
  },[root]);
}
