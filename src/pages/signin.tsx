import { signIn } from "next-auth/react";
import { FormEvent, FunctionComponent, useState } from "react";
import { Icons } from "~/components/Icons";

const SignInPage: FunctionComponent = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Validate the inputs
   * @param username
   * @param password
   * @returns true if the form is valid, false otherwise
   */
  function validateInputs(username: string, password: string): boolean {
    if (username.length < 1 || password.length < 1) return false;

    return true;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const isValid = validateInputs(username, password);

    if (isValid) {
      setLoading(true);

      // Sign in with credentials
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      setLoading(false);

      // Testing this out for now
      console.log(res);
      if (res!.ok) {
        console.log("Sign in successful");
        // Redirect to the home/dashboard page
      } else {
        if (res?.status === 401) setError("Invalid username or password");
        setError("An error occurred. Please try again.");
      }
    } else {
      setError("Please fill in all the fields");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="mb-4 w-full rounded bg-white px-8 pb-8 pt-6 shadow-md sm:w-3/4 md:w-1/2 lg:w-1/3">
        <h2 className="mb-6 text-center text-2xl font-bold">
          Sign in with PESU Auth
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              id="username"
              type="text"
              placeholder="Enter your SRN or PRN"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>
          <div className="mb-6">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              id="password"
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          {error && <p className="mb-4 text-sm italic text-red-500">{error}</p>}

          <div className="flex items-center justify-center">
            <button
              className="focus:shadow-outline flex w-1/3 items-center justify-center rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? <Icons.circularProgress /> : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
function validateForm(username: string, password: string) {
  throw new Error("Function not implemented.");
}
