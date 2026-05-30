import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | Zaplio"
        description="Masuk ke dashboard Zaplio untuk mengelola WhatsApp Anda"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
