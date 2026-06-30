module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: '必須項目を入力してください。' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'メール設定が未完了です。' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: process.env.CONTACT_EMAIL || 'meroron1027@gmail.com',
        reply_to: email,
        subject: `ポートフォリオお問い合わせ: ${name}`,
        text: [
          'ポートフォリオサイトからお問い合わせがありました。',
          '',
          '【お名前】',
          name,
          '',
          '【メールアドレス】',
          email,
          '',
          '【お問い合わせ内容】',
          message,
        ].join('\n'),
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    }

    const errorData = await response.json().catch(() => ({}));
    console.error('Resend API error:', errorData);
    return res.status(500).json({ success: false, error: 'メールの送信に失敗しました。' });
  } catch (err) {
    console.error('Contact API error:', err);
    return res.status(500).json({ success: false, error: 'メールの送信に失敗しました。' });
  }
};
