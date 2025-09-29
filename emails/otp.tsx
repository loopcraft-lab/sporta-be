import { Body, Button, Container, Head, Heading, Html, Img, Link, Section, Text } from '@react-email/components'
import * as React from 'react'

interface OTPEmailProps {
  otpCode: string
  title: string
}

const logoUrl = 'https://avatars.githubusercontent.com/t/13971284?s=116&v=4'

export const OTPEmail = ({ otpCode, title }: OTPEmailProps) => (
  <Html>
    <Head>
      <title>{title}</title>
    </Head>
    <Body style={main}>
      <Container style={container}>
        {/* Header với gradient background */}
        <Section style={header}>
          <Img src={logoUrl} width="60" height="60" alt="Sporta Logo" style={logo} />
          <Text style={brandName}>SPORTA</Text>
        </Section>

        {/* Main content */}
        <Section style={content}>
          <Heading style={heading}>Xác thực tài khoản</Heading>

          <Text style={description}>
            Chúng tôi đã gửi mã xác thực đến email của bạn. Vui lòng nhập mã bên dưới để hoàn tất quá trình xác thực.
          </Text>

          {/* OTP Code với design đẹp hơn */}
          <Section style={otpSection}>
            <Text style={otpLabel}>MÃ XÁC THỰC</Text>
            <Section style={codeContainer}>
              <Text style={code}>{otpCode}</Text>
            </Section>
          </Section>

          <Text style={helpText}>
            Nếu bạn không yêu cầu mã này, có thể ai đó đang cố gắng truy cập tài khoản của bạn.
            Vui lòng bỏ qua email này hoặc liên hệ với chúng tôi ngay lập tức.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Gửi từ <strong>Sporta</strong> với ❤️
          </Text>
          <Text style={footerSubtext}>
            © 2025 Sporta. Tất cả quyền được bảo lưu.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

OTPEmail.PreviewProps = {
  otpCode: '144833',
  title: 'Mã OTP',
} as OTPEmailProps

export default OTPEmail

// Styles with modern design
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '20px 0',
}

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  margin: '0 auto',
  maxWidth: '480px',
  overflow: 'hidden',
}

const header = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
}

const logo = {
  borderRadius: '50%',
  border: '3px solid rgba(255, 255, 255, 0.3)',
  margin: '0 auto 16px',
}

const brandName = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '0',
  textAlign: 'center' as const,
}

const content = {
  padding: '40px 32px',
}

const heading = {
  color: '#1a202c',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const description = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 32px',
  textAlign: 'center' as const,
}

const otpSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const otpLabel = {
  color: '#667eea',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '1px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
}

const codeContainer = {
  backgroundColor: '#f7fafc',
  border: '2px dashed #e2e8f0',
  borderRadius: '12px',
  margin: '0 auto',
  padding: '24px',
  width: 'fit-content',
}

const code = {
  color: '#2d3748',
  fontSize: '36px',
  fontWeight: '800',
  fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  letterSpacing: '8px',
  lineHeight: '1',
  margin: '0',
  textAlign: 'center' as const,
}

const securitySection = {
  backgroundColor: '#f0fff4',
  border: '1px solid #9ae6b4',
  borderRadius: '8px',
  margin: '32px 0',
  padding: '20px',
}

const securityTitle = {
  color: '#22543d',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const securityText = {
  color: '#276749',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const helpText = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}

const footer = {
  backgroundColor: '#f7fafc',
  borderTop: '1px solid #e2e8f0',
  padding: '24px 32px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#4a5568',
  fontSize: '14px',
  margin: '0 0 8px',
}

const footerSubtext = {
  color: '#a0aec0',
  fontSize: '12px',
  margin: '0',
}
