const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_KEY = process.env.REACT_APP_API_KEY;
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

// 确保 baseURL 配置正确
const baseURL = process.env.REACT_APP_API_URL || 'https://aip.baidubce.com';

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
}

interface ErnieResponse {
  id: string;
  object: string;
  created: number;
  result: string;
  need_clear_history: boolean;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

let cachedToken: string | null = null;
let tokenExpireTime: number | null = null;

// 获取访问令牌
async function getAccessToken(): Promise<string> {
  // 如果已有有效的token，直接返回
  if (cachedToken && tokenExpireTime && Date.now() < tokenExpireTime) {
    return cachedToken;
  }

  try {
    const response = await fetch(
      `/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`获取访问令牌失败: ${response.status}`);
    }

    const data: AccessTokenResponse = await response.json();
    
    // 缓存token和过期时间（提前5分钟过期）
    cachedToken = data.access_token;
    tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000;
    
    return data.access_token;
  } catch (error) {
    console.error('获取访问令牌错误:', error);
    throw new Error('无法获取访问令牌');
  }
}

/**
 * 发送消息到文心一言API并获取响应
 * @param message 用户输入的消息
 * @returns Promise<string> AI的响应内容
 */
export async function sendMessageToAPI(message: string): Promise<string> {
  try {
    const accessToken = await getAccessToken();
    
    const response = await fetch(`/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        stream: false,
        user_id: 'web_user',
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API错误响应:', errorData);
      throw new Error(errorData.error_msg || `API请求失败: ${response.status}`);
    }

    const data = await response.json();
    console.log('API响应:', data); // 添加日志

    if (data.error_code) {
      throw new Error(data.error_msg || '请求失败');
    }

    return data.result;
    
  } catch (error) {
    console.error('API调用错误:', error);
    throw error instanceof Error ? error : new Error('与AI服务器通信失败，请稍后重试');
  }
}

/**
 * 用于流式响应的API调用
 */
export async function streamMessageFromAPI(
  message: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const accessToken = await getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      try {
        const lines = chunk
          .split('\n')
          .filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            const data = JSON.parse(jsonStr);
            onChunk(data.result || '');
          }
        }
      } catch (e) {
        console.error('解析响应数据错误:', e);
      }
    }
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('请求被中止');
      return;
    }
    throw error;
  }
}

export function createAbortController() {
  return new AbortController();
} 