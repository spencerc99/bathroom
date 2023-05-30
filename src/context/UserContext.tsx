import { createContext, PropsWithChildren, useMemo } from "react";
import { Color, WebsiteAwarenessData, Person } from "../types";
import { useStickyState } from "../utils/localstorage";
import { useEffect, useState } from "react";
import randomColor from "randomcolor";
import { useYAwareness, useYDoc } from "zustand-yjs";
import { encodeSVG, getSvgForCursor, shuffleArray } from "../utils";
import { connectDoc, YJS_ROOM } from "../pages";

interface UserLetterContextType {
  loading: boolean;
  fromName: string;
  toName: string;
  fromStamp: string;
  content: string;
  currentUser: Person;
  sharedFingerprints: Array<WebsiteAwarenessData>;
  letterLocationPersistence: Record<number, any>;
  setFingerprint: (fingerprint: WebsiteAwarenessData["fingerprint"]) => void;
  setFromName: (fromName: string) => void;
  setToName: (toName: string) => void;
  setFromStamp: (fromStamp: string) => void;
  setContent: (content: string) => void;
  setColor: (color: Color) => void;
  currentDraggedLetter: string | undefined;
  setCurrentDraggedLetter: (url: string | undefined) => void;
}

export type PersistedUserLetterContextInfo = Pick<
  UserLetterContextType,
  "fromName" | "toName" | "fromStamp" | "content"
> &
  Pick<UserLetterContextType["currentUser"], "color">;

const DefaultUserLetterContext: UserLetterContextType = {
  loading: true,
  fromName: "",
  toName: "the internet",
  fromStamp: "",
  content: "",
  currentUser: {
    name: "",
    color: randomColor(),
  },
  sharedFingerprints: [],
  letterLocationPersistence: {},
  setFingerprint: () => {},
  setFromName: () => {},
  setToName: () => {},
  setFromStamp: () => {},
  setContent: () => {},
  setColor: () => {},
  currentDraggedLetter: undefined,
  setCurrentDraggedLetter: (_: string | undefined) => {},
};

export const DefaultPersistedUserLetterContext: PersistedUserLetterContextInfo =
  {
    ...DefaultUserLetterContext,
    color: DefaultUserLetterContext.currentUser.color,
  };

export const UserLetterContext = createContext<UserLetterContextType>(
  DefaultUserLetterContext
);

export const UserContextStorageId = "user-letter-context";
export const LetterLocationPersistenceStorageId = "letter-location-persistence";

export function UserLetterContextProvider({ children }: PropsWithChildren) {
  const [userContext, setUserContext] =
    useStickyState<PersistedUserLetterContextInfo>(
      UserContextStorageId,
      DefaultPersistedUserLetterContext
    );

  const [letterLocationPersistence, setLetterLocationPersistence] =
    useStickyState(LetterLocationPersistenceStorageId, {});

  const { fromName, toName, fromStamp, content, type, color } = userContext;
  const setFromName = (fromName: string) =>
    setUserContext({ ...userContext, fromName });
  const setToName = (toName: string) =>
    setUserContext({ ...userContext, toName });
  const setFromStamp = (fromStamp: string) =>
    setUserContext({ ...userContext, fromStamp });
  const setContent = (content: string) =>
    setUserContext({ ...userContext, content });
  const setColor = (color: Color) => setUserContext({ ...userContext, color });
  const [currentDraggedLetter, setCurrentDraggedLetter] = useState<
    undefined | string
  >(undefined);

  const currentUser = useMemo(
    () => ({
      name: fromName,
      stamp: fromStamp,
      color,
      // TODO: add url
    }),
    [color, fromName, fromStamp]
  );
  const yDoc = useYDoc(YJS_ROOM, connectDoc);

  const [awarenessData, setAwarenessData] =
    useYAwareness<WebsiteAwarenessData>(yDoc);

  // TODO: jank conversion but it should be true
  const sharedFingerprints: Array<WebsiteAwarenessData> = awarenessData
    .filter((s) => Boolean(s.fingerprint))
    .map((s) => s as WebsiteAwarenessData);
  function setFingerprint(fingerprint?: WebsiteAwarenessData["fingerprint"]) {
    setAwarenessData({ fingerprint });
  }

  // Handle local awareness data for user
  useEffect(() => {
    setAwarenessData({ user: currentUser });
  }, [currentUser, setAwarenessData]);

  useEffect(() => {
    const userCursorSvgEncoded = encodeSVG(getSvgForCursor(color));
    document.documentElement.style.cursor = `url("data:image/svg+xml,${userCursorSvgEncoded}"), auto`;
  }, [color]);

  return (
    <UserLetterContext.Provider
      value={{
        fromName,
        toName,
        fromStamp,
        content,
        sharedFingerprints,
        currentUser: currentUser,
        letterLocationPersistence,
        loading: false,
        setFingerprint,
        setFromName,
        setToName,
        setFromStamp,
        setContent,
        setColor,
        currentDraggedLetter,
        setCurrentDraggedLetter,
      }}
    >
      {children}
    </UserLetterContext.Provider>
  );
}
