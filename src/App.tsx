import { initCursorChat } from 'cursor-chat';
import { WebrtcProvider } from 'y-webrtc';
import Y from 'yjs';
import { StartAwarenessFunction } from 'zustand-yjs';
import { Bathroom } from '../components/Bathroom';
import {
  DefaultPersistedUserLetterContext,
  PersistedUserLetterContextInfo,
  UserContextStorageId,
} from '../context/UserContext';
import styles from '../styles/Home.module.scss';
import { getLocalStorageItem } from '../utils/localstorage';

export const YJS_ROOM = 'one-person-website';

export const connectDoc = (
  doc: Y.Doc,
  startAwareness: StartAwarenessFunction,
) => {
  // Hack to get around server-side rendering build
  if (typeof window === 'undefined') {
    return () => {};
  }

  const ctx =
    getLocalStorageItem<PersistedUserLetterContextInfo>(UserContextStorageId) ??
    DefaultPersistedUserLetterContext;
  const color = ctx.color;
  console.log(
    `Connecting to the internet as ${color}... ${doc.guid} initialized`,
  );

  const stopCursorChatCallback = initCursorChat('(we)bsite', {
    yDoc: doc,
    // @ts-ignore
    color,
  });
  // @ts-ignore
  const provider = new WebrtcProvider(YJS_ROOM, doc, {
    signaling: [
      'wss://signalling.communities.digital',
      // "ws://localhost:4444",
      'wss://signaling.yjs.dev',
      'wss://y-webrtc-signaling-eu.herokuapp.com',
    ],
  });
  console.log('Connected!');
  const stopAwarenessCallback = startAwareness(provider);
  return () => {
    provider.disconnect();
    stopAwarenessCallback();
    stopCursorChatCallback();
    console.log('Disconnected from the internet...');
  };
};

export default function Home() {
  return (
    <main>
      <h1 className={styles.title}>1 person website</h1>
      <Bathroom />
    </main>
  );
}
