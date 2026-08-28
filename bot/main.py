import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

load_dotenv()
TOKEN = os.getenv("BOT_TOKEN")

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def strat_handler(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🎬 Відкрити Peekflix",
            web_app=WebAppInfo(url="https://peekflix-9rgovtaoy-b4rul1x.vercel.app")
        )]
    ])

    await message.answer(
        "Привіт! 👋 Це Peekflix — трекер твоїх фільмів.",
        reply_markup=keyboard
    )

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())