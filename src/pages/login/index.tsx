import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { FunctionComponent, useEffect, useState } from "react";
import Navbar from "../ui/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { inter, montserrat } from "~/fonts";
import { sha256 } from "js-sha256";
import { useAtom } from "jotai";
import { clubID } from "~/atoms";

const SignInPage: FunctionComponent = () => {
    const [error, setError] = useState<null | string>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { data: session } = useSession();
    const [ _, setClubId ] = useAtom(clubID);

    const formSchema = z.object({
        username: z.string().min(1, { message: "Username cannot be empty" }),
        password: z.string().min(1, { message: "Password cannot be empty" }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        }
    })

    const router = useRouter();
    const { callbackUrl } = router.query;

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {

        setLoading(true);

        let res = null;

        if (values.username.match(/(?:PES[12][UP]G\d{2}(?:AM|CS|EE|EC|ME|BT|CV)\d{3})|(?:PES[12]20\d{2}\d{5})/))    {
            res = await signIn("pesu-auth", {
                username: values.username,
                password: values.password,
                redirect: false,
            });
            setLoading(false);
            
            if (res !== null && res!.ok) {
                router.push(callbackUrl as string || '/events');
            } else {
                if (res?.status === 401) setError("Invalid username or password");
                setError("An error occurred. Please try again.");
            }
        }
        else    {
            res = await signIn("tix-auth", {
                username: values.username,
                password: values.password,
                redirect: false,
            });
            setLoading(false);
            
            if (res!.ok) {
                if(session?.user.role == "admin") {
                    router.push(callbackUrl as string || '/admin');
                }
                else {
                    setClubId(values.username);
                    router.push(callbackUrl as string || '/events');
                }
            } else {
                if (res?.status === 401)    {
                    setError("Invalid username or password");
                }
                else    {
                    setError("An error occurred. Please try again.");
                }
            }
        }
    };

    return (
        <div className={`container justify-center ${montserrat}`}>
            <Navbar hidelogin />
            <Card>
                <CardHeader>
                    <CardTitle>Member Login</CardTitle>
                    <CardDescription>Log in using your PESU Academy or club credentials</CardDescription>
                </CardHeader>
                <CardContent className="mt-5">
                    <Form {...form}>
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /><br/>
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <br/>
                        { error && <div className="text-red-500 p-2 text-sm w-full text-center">{error}</div> }
                        <Button type="submit" className="w-full flex gap-x-3" onClick={form.handleSubmit(handleSubmit)} disabled={loading}>
                            { loading ? <LoaderCircle className="animate-spin text-primary-foreground" /> : "Submit" }
                        </Button>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SignInPage;
