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
        const PayOSModule: any = await import('@payos/node')
        const PayOS = PayOSModule.PayOS

        this.payOS = new PayOS(
          envConfig.PAYMENT_CLIENT_ID,
          envConfig.PAYMENT_API_KEY,
          envConfig.PAYMENT_CHECKSUM_KEY
        )
      } catch (error) {
        console.error('❌ Failed to initialize PayOS:', error)
        throw error
      }
    })()

    await this.initPromise
  }

  /**
   * Create payment link for booking
   * PayOS v2 uses: payOS.paymentRequests.create()
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

      const paymentData = {
        orderCode: data.orderCode,
        amount: data.amount,
        description: data.description,
        returnUrl: data.returnUrl,
        cancelUrl: data.cancelUrl,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: data.buyerPhone
      }

      // PayOS v2 API: paymentRequests.create()
      const result = await this.payOS.paymentRequests.create(paymentData)

      // Return in old format for compatibility
      return {
        checkoutUrl: result.checkoutUrl,
        qrCode: result.qrCode,
        ...result
      }
    } catch (error) {
      console.error('❌ PayOS payment error:', error)
      if (error.response) {
        console.error('Response:', error.response.data)
      }
      throw error
    }
  }

  /**
   * Get payment info
   * PayOS v2: paymentRequests.get(orderCode)
   */
  async getPaymentInfo(orderCode: number) {
    try {
      await this.initialize()
      const result = await this.payOS.paymentRequests.get(orderCode)
      return result
    } catch (error) {
      console.error('PayOS getPaymentInfo error:', error)
      throw error
    }
  }

  /**
   * Cancel payment link
   * PayOS v2: paymentRequests.cancel(orderCode, reason)
   */
  async cancelPaymentLink(orderCode: number, cancellationReason?: string) {
    try {
      await this.initialize()
      const result = await this.payOS.paymentRequests.cancel(
        orderCode,
        cancellationReason
      )
      return result
    } catch (error) {
      console.error('PayOS cancelPaymentLink error:', error)
      throw error
    }
  }

  /**
   * Verify webhook signature
   * PayOS v2: webhooks.verifyWebhookData()
   */
  async verifyWebhookData(webhookData: any): Promise<boolean> {
    try {
      await this.initialize()
      const result = await this.payOS.webhooks.verifyWebhookData(webhookData)
      return result
    } catch (error) {
      console.error('PayOS verifyWebhookData error:', error)
      return false
    }
  }
}

export const payOSService = new PayOSService()
