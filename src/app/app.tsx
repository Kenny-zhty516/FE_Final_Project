import { Fetch } from "components/atoms/fetch/fetch";
import { Book, BookList } from "components/organisms/book-list";
import { ChangeEvent, MouseEvent, useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";

import * as Realm from "realm-web";

// Create a component that lets an anonymous user log in
interface LoginProps {
  setUser: (user: Realm.User) => void;
}

const app = new Realm.App({ id: "application-0-ygaoq" });

// Create a component that displays the given user's details
const UserDetail = ({ user }: { user: Realm.User }) => {
  window.console.log("User", user);

  const [bookName, setBookName] = useState("");
  const [db, setDb] =
    useState<globalThis.Realm.Services.MongoDBDatabase | null>(null);

  useEffect(() => {
    if (user !== null) {
      const realmService = user.mongoClient("mongodb-atlas");
      const booksDb = realmService.db("books");
      setDb(booksDb);
    }
  }, [user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBookName(e.target.value);
  };

  const handleSaveClick = async (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (db) {
      const record = {
        book_name: bookName,
        // Must have "owner_id", and "owner_name" values, so that app service can
        // verify the data belongs to the authenticated user and the user has
        // permission to perform operation on this data.
        owner_id: user.id,
        owner_name: user.profile.name,
      };
      db.collection("reading-list").insertOne(record);
    }
  };

  return (
    <div>
      <p>Logged in with user id: {user.id}</p>
      <h2>First name: {user.profile.firstName}</h2>
      <h2>Last name: {user.profile.lastName}</h2>
      <section>
        <input
          type="text"
          placeholder="Book Name"
          value={bookName}
          onChange={handleInputChange}
        />
        <button type="button" onClick={handleSaveClick}>
          Save Book Name
        </button>
      </section>
    </div>
  );
};

// Create a component that lets an anonymous user log in
interface LoginProps {
  setUser: (user: Realm.User) => void;
}

const Login = ({ setUser }: LoginProps) => {
  const loginGoogle = async () => {
    // const user: Realm.User = await app.logIn(Realm.Credentials.google({ redirectUrl: "http://localhost:3000/auth.html" }));
    // TODO change this to Netlify link after deploy
    const user: Realm.User = await app.logIn(
      Realm.Credentials.google({
        // redirectUrl: "http://localhost:3000/auth.html",
        redirectUrl: "https://meek-bavarois-29455f.netlify.app/",
      })
    );
    setUser(user);
  };
  return <button onClick={loginGoogle}>Log In</button>;
};

interface LogOutProps {
  user: Realm.User;
  setUser: (user: Realm.User | null) => void;
}

const LogOut = ({ user, setUser }: LogOutProps) => {
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (user !== null && app.currentUser) {
      app.currentUser.logOut();
      setUser(null);
    }
  };
  return <button onClick={handleClick}>Log Out</button>;
};

interface SearchResponse {
  docs: Book[];
  numFound: number;
}

function App() {
  const [searchUri, setSearchUri] = useState<string | null>(null);
  // Keep the logged in Realm user in local state. This lets the app re-render
  // whenever the current user changes (e.g. logs in or logs out).
  const [user, setUser] = useState<Realm.User | null>(app.currentUser);
  // If a user is logged in, show their details. Otherwise, show the login screen.

  // * version before login page ================================
  // const [bookName, setBookName] = useState("");
  // const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setBookName(e.target.value);
  // };
  // const handleClick = async (event: MouseEvent<HTMLElement>) => {
  //   event.preventDefault();
  //   const encodedBookName = encodeURIComponent(bookName);
  //   const searchUrl = `https://openlibrary.org/search.json?q=${encodedBookName}`;
  //   setSearchUri(searchUrl);
  // };
  // ================================================

  const SignupSchema = Yup.object().shape({
    bookName: Yup.string()
      .min(5, "Too Short!")
      .max(50, "Too Long!")
      .required("Required"),
  });

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-start gap-4 mt-20 text-center">
      <div className="App">
        <div className="App-header">
          {user ? <UserDetail user={user} /> : <Login setUser={setUser} />}
        </div>
        {user ? <LogOut setUser={setUser} user={user} /> : <></>}
      </div>

      <div className="flex">
        <Formik
          initialValues={{
            bookName: "",
          }}
          validationSchema={SignupSchema}
          onSubmit={(values) => {
            window.console.log(values);
            const encodedBookName = encodeURIComponent(values.bookName);
            const searchUrl = `https://openlibrary.org/search.json?q=${encodedBookName}`;
            setSearchUri(searchUrl);
          }}
        >
          {({ errors, touched }) => (
            <Form>
              <Field
                name="bookName"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Enter Book Name"
                title="Please put a book name"
              />

              {errors.bookName && touched.bookName ? (
                <div>{errors.bookName}</div>
              ) : null}

              <button
                // type="button"
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ml-2"
                // onClick={handleClick}
              >
                Search
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className="flex">
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Fetch<SearchResponse>
            uri={searchUri}
            renderData={(data) => (
              <div className="flex flex-col">
                <div>Found {data.numFound} books</div>
                <BookList books={data.docs} />
              </div>
            )}
          ></Fetch>
        </ErrorBoundary>
        <div className="pl-4">
          <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default App;
