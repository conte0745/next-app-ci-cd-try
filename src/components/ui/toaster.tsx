'use client';

import { Toaster as HotToaster, toast } from 'react-hot-toast';

// Chakra UIのtoasterは廃止
// react-hot-toastのtoast関数を利用してください
export { toast };

// react-hot-toastのToasterコンポーネントをそのままエクスポート
export const Toaster = HotToaster;
