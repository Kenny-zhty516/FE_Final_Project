import { Fetch } from "components/atoms/fetch/fetch";
import { Book, BookList } from "components/organisms/book-list";
import { ChangeEvent, MouseEvent, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import { Formik, Field, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';

interface SearchResponse {
  docs: Book[];
  numFound: number;
}

function App() {
  const [searchUri, setSearchUri] = useState<string | null>(null);
  const [bookName, setBookName] = useState("");

  // const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setBookName(e.target.value);
  // };

  // const handleClick = async (event: MouseEvent<HTMLElement>) => {
  //   event.preventDefault();
  //   const encodedBookName = encodeURIComponent(bookName);
  //   const searchUrl = `https://openlibrary.org/search.json?q=${encodedBookName}`;
  //   setSearchUri(searchUrl);
  // };

  const SignupSchema = Yup.object().shape({
    bookName: Yup.string()
      .min(5, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required'),
  });

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-start gap-4 mt-20 text-center">
      <div className="flex">
        <Formik
          initialValues={{
            bookName: '',
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
              <Field name="bookName"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Enter Book Name"
                title="Please put a book name" />

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
