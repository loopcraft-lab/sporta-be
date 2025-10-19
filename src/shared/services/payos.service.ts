import envConfig from '@/config/env.config'

export class PayOSService {
  private payOS: any = null
  private initPromise: Promise<void> | null = null

  private async initialize() {
    if (this.payOS) return

    if (this.initPromise) {
      await this.initPromise
      return
    }

    this.initPromise = (async () => {
      try {
        const PayOSModule = require('@payos/node')

        // Try different export patterns
        const PayOSConstructor =
          PayOSModule.default?.default ||
          PayOSModule.default ||
          PayOSModule.PayOS ||
          PayOSModule

        console.log('PayOS Module type:', typeof PayOSConstructor)

        this.payOS = new PayOSConstructor(
          envConfig.PAYMENT_CLIENT_ID,
          envConfig.PAYMENT_API_KEY,
          envConfig.PAYMENT_CHECKSUM_KEY
        )

        console.log('PayOS initialized successfully')
      } catch (error) {
        console.error('Failed to initialize PayOS:', error)
        throw error
      }
    })()

    await this.initPromise
  }

  /**
   * Create payment link for booking
   */
  async createPaymentLink(data: {
    orderCode: number
    amount: number
    description: string
    returnUrl: string
    cancelUrl: string
    buyerName?: string
    buyerEmail?: string
    buyerPhone?: string
  }) {
    try {
      await this.initialize()

      const paymentLinkData = {
        orderCode: data.orderCode,
        amount: data.amount,
        description: data.description,
        returnUrl: data.returnUrl,
        cancelUrl: data.cancelUrl,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: data.buyerPhone
      }

      const paymentLink = await this.payOS.createPaymentLink(paymentLinkData)
      return paymentLink
    } catch (error) {
      console.error('PayOS createPaymentLink error:', error)
      throw error
    }
  }

  /**
   * Get payment info
   */
  async getPaymentInfo(orderCode: number) {
    try {
      await this.initialize()
      const paymentInfo = await this.payOS.getPaymentLinkInformation(orderCode)
      return paymentInfo
    } catch (error) {
      console.error('PayOS getPaymentInfo error:', error)
      throw error
    }
  }

  /**
   * Cancel payment link
   */
  async cancelPaymentLink(orderCode: number, cancellationReason?: string) {
    try {
      await this.initialize()
      const result = await this.payOS.cancelPaymentLink(orderCode, cancellationReason)
      return result
    } catch (error) {
      console.error('PayOS cancelPaymentLink error:', error)
      throw error
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookData(webhookData: any): Promise<boolean> {
    try {
      await this.initialize()
      return this.payOS.verifyPaymentWebhookData(webhookData)
    } catch (error) {
      console.error('PayOS verifyWebhookData error:', error)
      return false
    }
  }
}

export const payOSService = new PayOSService()
