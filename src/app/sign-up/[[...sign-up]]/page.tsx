import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#D4AF37',
            colorBackground: '#111111',
            colorText: '#ffffff',
            colorTextSecondary: '#9ca3af',
            colorInputBackground: '#111111',
            colorInputText: '#ffffff',
          },
          elements: {
            card: 'bg-[#111111] border border-[#222222] shadow-2xl',
            headerTitle: 'text-white',
            headerSubtitle: 'text-gray-400',
            socialButtonsBlockButton: 'bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#222222]',
            dividerLine: 'bg-[#333333]',
            dividerText: 'text-gray-500',
            formFieldInput: 'bg-[#1a1a1a] border-[#333333] text-white focus:border-[#D4AF37]',
            formFieldLabel: 'text-gray-400',
            footerActionLink: 'text-[#D4AF37]',
          },
        }}
        fallbackRedirectUrl="/onboarding"
      />
    </div>
  )
}
